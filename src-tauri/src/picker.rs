use rand::seq::SliceRandom;
use rand::Rng;

use crate::config::{AppConfig, Student};
use crate::models::PickedStudent;

const WEIGHT_BOOST_GAMMA: f64 = 1.5;

#[derive(Debug, Clone)]
pub(crate) struct WeightedPool {
    pub(crate) entries: Vec<(String, f64)>,
    pub(crate) total_weight: f64,
}

fn valid_student_entries(students: &[Student]) -> impl Iterator<Item = (String, f64)> + '_ {
    students.iter().filter_map(|student| {
        let name = student.name.trim();
        if name.is_empty() {
            None
        } else {
            Some((name.to_string(), student.weight.max(0.0)))
        }
    })
}

pub(crate) fn assign_rarity(pity_counter: &mut u32) -> String {
    *pity_counter += 1;
    let is_pity_draw = *pity_counter % 10 == 0;

    let mut rng = rand::thread_rng();
    let rand_val: f64 = rng.gen();

    let mut rarity = "blue";
    if rand_val > 0.97 {
        rarity = "pink";
    } else if rand_val > 0.785 {
        rarity = "gold";
    }

    if is_pity_draw && rarity == "blue" {
        let upgrade_rand: f64 = rng.gen();
        rarity = if upgrade_rand > 0.95 { "pink" } else { "gold" };
    }

    rarity.to_string()
}

fn enrich_picked_student(name: &str, students: &[Student], rarity: String) -> PickedStudent {
    let student = students.iter().find(|s| s.name.trim() == name);
    PickedStudent {
        name: name.to_string(),
        rarity,
        avatar: student.and_then(|s| s.avatar.clone()),
        academy: student.and_then(|s| s.academy.clone()),
        club: student.and_then(|s| s.club.clone()),
    }
}

pub(crate) fn build_weighted_pool(config: &AppConfig) -> WeightedPool {
    let entries = valid_student_entries(&config.student_list)
        .map(|(name, weight)| (name, weight.powf(WEIGHT_BOOST_GAMMA)))
        .collect::<Vec<_>>();
    let total_weight = entries.iter().map(|(_, weight)| *weight).sum();
    WeightedPool {
        entries,
        total_weight,
    }
}

pub(crate) fn pick_students_with_repeat(
    weighted_pool: &WeightedPool,
    count: i32,
    students: &[Student],
    pity_counter: &mut u32,
) -> Vec<PickedStudent> {
    if weighted_pool.entries.is_empty() || count <= 0 {
        return Vec::new();
    }

    let target_count = count.max(0) as usize;
    let mut rng = rand::thread_rng();
    let mut picked = Vec::with_capacity(target_count);

    for _ in 0..target_count {
        let mut pick_index = None;
        if weighted_pool.total_weight > 0.0 {
            let mut roll = rng.gen::<f64>() * weighted_pool.total_weight;
            for (index, (_, weight)) in weighted_pool.entries.iter().enumerate() {
                roll -= *weight;
                if roll <= 0.0 {
                    pick_index = Some(index);
                    break;
                }
            }
        }
        let index = pick_index.unwrap_or_else(|| rng.gen_range(0..weighted_pool.entries.len()));
        let name = weighted_pool.entries[index].0.clone();
        let rarity = assign_rarity(pity_counter);
        picked.push(enrich_picked_student(&name, students, rarity));
    }

    picked
}

pub(crate) fn pick_students_without_repeat(
    config: &AppConfig,
    count: i32,
    pity_counter: &mut u32,
) -> Vec<PickedStudent> {
    let pool = valid_student_entries(&config.student_list).collect::<Vec<_>>();

    if pool.is_empty() || count <= 0 {
        return Vec::new();
    }

    let target_count = count.max(0) as usize;
    let mut rng = rand::thread_rng();
    let mut picked = Vec::with_capacity(target_count.min(pool.len()));

    let mut positive_pool = pool
        .iter()
        .filter(|(_, weight)| *weight > 0.0)
        .map(|(name, weight)| {
            let random = rng.gen::<f64>().max(f64::MIN_POSITIVE);
            (name.clone(), -random.ln() / *weight)
        })
        .collect::<Vec<_>>();
    positive_pool.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

    for (name, _) in positive_pool.into_iter().take(target_count) {
        let rarity = assign_rarity(pity_counter);
        picked.push(enrich_picked_student(&name, &config.student_list, rarity));
    }

    if picked.len() < target_count {
        let mut zero_pool = pool
            .iter()
            .filter(|(_, weight)| *weight <= 0.0)
            .map(|(name, _)| name.clone())
            .collect::<Vec<_>>();
        zero_pool.shuffle(&mut rng);
        for name in zero_pool.into_iter().take(target_count - picked.len()) {
            let rarity = assign_rarity(pity_counter);
            picked.push(enrich_picked_student(&name, &config.student_list, rarity));
        }
    }

    picked
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::AppConfig;

    fn make_config(students: Vec<(&str, f64)>) -> AppConfig {
        AppConfig {
            student_list: students
                .into_iter()
                .map(|(name, weight)| Student {
                    name: name.to_string(),
                    weight,
                    avatar: None,
                    academy: None,
                    club: None,
                })
                .collect(),
            ..AppConfig::default()
        }
    }

    #[test]
    fn build_weighted_pool_skips_empty_names_and_clamps_negative_weight() {
        let cfg = make_config(vec![("阿罗娜", 1.0), ("", 5.0), ("普拉娜", -3.0)]);
        let pool = build_weighted_pool(&cfg);

        assert_eq!(pool.entries.len(), 2);
        assert!(pool.entries.iter().any(|(name, _)| name == "阿罗娜"));
        assert!(pool
            .entries
            .iter()
            .any(|(name, weight)| name == "普拉娜" && *weight == 0.0));
        assert!(pool.total_weight > 0.0);
    }

    #[test]
    fn pick_with_repeat_returns_empty_when_pool_or_count_invalid() {
        let cfg = make_config(vec![("阿罗娜", 1.0)]);
        let pool = build_weighted_pool(&cfg);
        let empty_pool = build_weighted_pool(&make_config(vec![]));
        let mut pity = 0;

        assert!(pick_students_with_repeat(&pool, 0, &cfg.student_list, &mut pity).is_empty());
        assert!(pick_students_with_repeat(&pool, -3, &cfg.student_list, &mut pity).is_empty());
        assert!(pick_students_with_repeat(&empty_pool, 5, &cfg.student_list, &mut pity).is_empty());
    }

    #[test]
    fn pick_with_repeat_only_returns_students_from_config() {
        let cfg = make_config(vec![("阿罗娜", 1.0), ("普拉娜", 2.0), ("白子", 3.0)]);
        let pool = build_weighted_pool(&cfg);
        let mut pity = 0;
        let picked = pick_students_with_repeat(&pool, 50, &cfg.student_list, &mut pity);

        assert_eq!(picked.len(), 50);
        let names: std::collections::HashSet<_> =
            cfg.student_list.iter().map(|s| s.name.clone()).collect();
        for student in &picked {
            assert!(
                names.contains(&student.name),
                "意外的学生: {}",
                student.name
            );
            assert!(["blue", "gold", "pink"].contains(&student.rarity.as_str()));
        }
    }

    #[test]
    fn pick_without_repeat_yields_unique_names_up_to_pool_size() {
        let cfg = make_config(vec![
            ("阿罗娜", 1.0),
            ("普拉娜", 2.0),
            ("白子", 3.0),
            ("日富美", 0.0),
        ]);
        let mut pity = 0;
        let picked = pick_students_without_repeat(&cfg, 4, &mut pity);

        let names: Vec<_> = picked.iter().map(|p| p.name.clone()).collect();
        let unique: std::collections::HashSet<_> = names.iter().cloned().collect();
        assert_eq!(picked.len(), 4);
        assert_eq!(unique.len(), 4);
    }

    #[test]
    fn pick_without_repeat_returns_empty_for_empty_pool_or_zero_count() {
        let empty_cfg = make_config(vec![]);
        let mut pity = 0;
        assert!(pick_students_without_repeat(&empty_cfg, 5, &mut pity).is_empty());

        let cfg = make_config(vec![("阿罗娜", 1.0)]);
        assert!(pick_students_without_repeat(&cfg, 0, &mut pity).is_empty());
    }

    #[test]
    fn assign_rarity_pity_promotes_every_tenth_draw() {
        let mut pity = 0;
        for _ in 0..9 {
            assign_rarity(&mut pity);
        }
        let tenth = assign_rarity(&mut pity);
        assert!(
            tenth == "gold" || tenth == "pink",
            "保底应升级，实际: {tenth}"
        );
        assert_eq!(pity, 10);
    }
}
