use std::collections::{HashMap, HashSet};

use super::{Student, StudentListParseResult};

pub(crate) fn parse_student_list_text_impl(
    raw_text: &str,
    existing_students: &[Student],
) -> StudentListParseResult {
    let mut existing_map = HashMap::with_capacity(existing_students.len());
    for student in existing_students {
        let name = student.name.trim();
        if !name.is_empty() {
            existing_map.insert(name.to_string(), student.clone());
        }
    }

    let mut seen = HashSet::new();
    let mut student_list = Vec::new();

    for name in raw_text
        .split(['\n', '\r', ','])
        .map(str::trim)
        .filter(|name| !name.is_empty())
    {
        if seen.insert(name.to_string()) {
            if let Some(existing) = existing_map.get(name) {
                let weight = if existing.weight.is_finite() {
                    existing.weight
                } else {
                    1.0
                };
                student_list.push(Student {
                    name: name.to_string(),
                    weight,
                    avatar: existing.avatar.clone(),
                    academy: existing.academy.clone(),
                    club: existing.club.clone(),
                });
            } else {
                student_list.push(Student {
                    name: name.to_string(),
                    weight: 1.0,
                    avatar: None,
                    academy: None,
                    club: None,
                });
            }
        }
    }

    let normalized_text = student_list
        .iter()
        .map(|student| student.name.as_str())
        .collect::<Vec<_>>()
        .join("\n");

    StudentListParseResult {
        student_list,
        normalized_text,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_student_list_text_dedupes_and_preserves_weights() {
        let existing_students = vec![
            Student {
                name: "Alice".to_string(),
                weight: 1.7,
                avatar: Some("/img/alice.png".to_string()),
                academy: Some("Abydos".to_string()),
                club: None,
            },
            Student {
                name: "Bob".to_string(),
                weight: 0.4,
                avatar: None,
                academy: None,
                club: None,
            },
        ];

        let result =
            parse_student_list_text_impl(" Alice\r\nBob, Charlie\nAlice\n\n", &existing_students);

        assert_eq!(result.normalized_text, "Alice\nBob\nCharlie");
        assert_eq!(result.student_list.len(), 3);
        assert_eq!(result.student_list[0].name, "Alice");
        assert_eq!(result.student_list[0].weight, 1.7);
        assert_eq!(result.student_list[1].name, "Bob");
        assert_eq!(result.student_list[1].weight, 0.4);
        assert_eq!(result.student_list[2].name, "Charlie");
        assert_eq!(result.student_list[2].weight, 1.0);
    }
}
