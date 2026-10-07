namespace KVRandom;

public sealed class Picker
{
  private ulong pityCounter;

  public JsonArray Pick(JsonObject config, int count, JsonArray? boosts = null)
  {
    var result = new JsonArray();
    if (count <= 0) return result;
    var multipliers = (boosts ?? new JsonArray()).OfType<JsonObject>()
        .GroupBy(boost => ConfigStore.Text(boost["studentName"]).Trim())
        .ToDictionary(group => group.Key, group => Math.Max(1, ConfigStore.Number(group.Last()["boostMultiplier"], 1)));
    var students = ConfigStore.NormalizeStudents(config["studentList"]).OfType<JsonObject>().ToList();
    var pool = students.Select(student =>
    {
      var name = ConfigStore.Text(student["name"]);
      var weight = Math.Max(0, ConfigStore.Number(student["weight"], 1));
      if (multipliers.TryGetValue(name, out var multiplier)) weight *= multiplier;
      return (Student: student, Weight: Math.Pow(weight, 1.5));
    }).ToList();
    // Scale before summing so very large finite input weights cannot overflow the lottery.
    var max = pool.Select(entry => entry.Weight).DefaultIfEmpty(0).Max();
    if (double.IsPositiveInfinity(max))
      pool = pool.Select(entry => (entry.Student, double.IsPositiveInfinity(entry.Weight) ? 1.0 : 0.0)).ToList();
    else if (max > 0)
      pool = pool.Select(entry => (entry.Student, entry.Weight / max)).ToList();

    if (ConfigStore.Flag(config["allowRepeatDraw"], true))
    {
      var total = pool.Sum(entry => entry.Weight);
      for (var n = 0; n < count && pool.Count > 0; n++)
      {
        var index = Random.Shared.Next(pool.Count);
        if (total > 0)
        {
          var roll = Random.Shared.NextDouble() * total;
          for (var i = 0; i < pool.Count; i++)
          {
            roll -= pool[i].Weight;
            if (pool[i].Weight > 0 && roll <= 0) { index = i; break; }
          }
        }
        result.Add(Enrich(pool[index].Student));
      }
    }
    else
    {
      var positive = pool.Where(entry => entry.Weight > 0)
          .Select(entry => (entry.Student, Key: -Math.Log(Math.Max(Random.Shared.NextDouble(), double.Epsilon)) / entry.Weight))
          .OrderBy(entry => entry.Key).Select(entry => entry.Student);
      var zero = pool.Where(entry => entry.Weight <= 0).Select(entry => entry.Student).ToArray();
      Random.Shared.Shuffle(zero);
      foreach (var student in positive.Concat(zero).Take(count)) result.Add(Enrich(student));
    }
    return result;
  }

  public JsonObject Select(JsonObject config, string name)
  {
    var student = ConfigStore.NormalizeStudents(config["studentList"]).OfType<JsonObject>()
        .FirstOrDefault(s => ConfigStore.Text(s["name"]) == name.Trim())
        ?? throw new InvalidOperationException($"未找到学生: {name}");
    return Enrich(student);
  }

  private JsonObject Enrich(JsonObject student)
  {
    var rarity = Random.Shared.NextDouble() switch { > 0.97 => "pink", > 0.785 => "gold", _ => "blue" };
    if (++pityCounter % 10 == 0 && rarity == "blue") rarity = Random.Shared.NextDouble() > 0.95 ? "pink" : "gold";
    var result = (JsonObject)student.DeepClone();
    result.Remove("weight");
    result["rarity"] = rarity;
    return result;
  }
}
