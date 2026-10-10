// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync(
  new URL('../.github/workflows/build-windows.yml', import.meta.url),
  'utf8'
).replace(/\r\n/g, '\n')
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

function stepScript(name: string, event = 'push') {
  const start = workflow.indexOf(`      - name: ${name}\n`)
  const end = workflow.indexOf('\n      - name:', start + 1)
  return workflow
    .slice(start, end)
    .split('        run: |\n')[1]
    .split('\n')
    .map((line) => line.slice(10))
    .join('\n')
    .replaceAll('${{ github.event_name }}', event)
    .replaceAll('${{ github.run_number }}', '123')
    .replaceAll('${{ github.sha }}', 'a'.repeat(40))
}

function runPowerShell(script: string, env: Record<string, string>) {
  return execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-EncodedCommand',
      Buffer.from(
        '[Console]::OutputEncoding = [Text.Encoding]::UTF8; $ErrorActionPreference = "Stop";\n' +
          script,
        'utf16le'
      ).toString('base64'),
    ],
    { encoding: 'utf8', env: { ...process.env, ...env } }
  ).trim()
}

describe('release workflow', () => {
  it('passes commit messages and release inputs through environment variables', () => {
    for (const name of ['Detect release mode', 'Package artifacts']) {
      expect(stepScript(name)).not.toMatch(/\$\{\{ (github\.event\.head_commit\.message|inputs\.)/)
      expect(stepScript(name)).toContain('$env:RELEASE_COMMIT_MESSAGE')
    }
    expect(stepScript('Detect release mode')).toContain('$env:RELEASE_TAG')
    expect(stepScript('Detect release mode')).toContain('$env:RELEASE_NAME')
  })

  it.skipIf(process.platform !== 'win32').each([
    {
      event: 'push',
      message: '修复: "招募动画" $(throw "not code") [ci]',
      tag: `v${version}`,
      name: `v${version}`,
      prerelease: 'false',
    },
    {
      event: 'push',
      message: '修复: "招募动画" $(throw "not code")\n[unstable] [ci]',
      tag: 'preview-123',
      name: 'Preview 123',
      prerelease: 'true',
    },
    {
      event: 'workflow_dispatch',
      message: '[unstable]',
      tag: 'v1.2.3',
      name: '发布 "动画" $(throw "not code")',
      prerelease: 'false',
    },
  ])(
    'keeps $event release text literal ($prerelease)',
    ({ event, message, tag, name, prerelease }) => {
      const folder = mkdtempSync(join(tmpdir(), 'KVRandom-release-test-'))
      try {
        const output = join(folder, 'output.txt')
        const env = {
          RELEASE_COMMIT_MESSAGE: message,
          RELEASE_TAG: tag,
          RELEASE_NAME: name,
          GITHUB_OUTPUT: output,
        }
        runPowerShell(stepScript('Detect release mode', event), env)
        const values = Object.fromEntries(
          readFileSync(output, 'utf8')
            .replace(/\uFEFF/g, '')
            .trim()
            .split(/\r?\n/)
            .map((line) => {
              const index = line.indexOf('=')
              return [line.slice(0, index), line.slice(index + 1)]
            })
        )
        expect(values).toEqual({ tag, name, prerelease })

        // Check metadata selection without creating or compressing release artifacts.
        const metadata = stepScript('Package artifacts', event).split('mkdir artifacts')[0]
        expect(runPowerShell(metadata + '\n$type', env)).toBe(
          prerelease === 'true' ? 'preview' : 'stable'
        )
      } finally {
        rmSync(folder, { recursive: true, force: true })
      }
    }
  )
})
