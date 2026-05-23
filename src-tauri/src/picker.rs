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
