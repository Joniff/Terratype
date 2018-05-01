using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;

namespace Terratype.Indexer.Processors
{
	public class GenericProcessor : PropertyBase
	{
		public GenericProcessor(IList<Entry> results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (task.Json.Type == JTokenType.Object)
			{
				var obj = task.Json as JObject;
				if (IsTerratype(obj))
				{
					int? datatypeId = obj.GetValue("datatypeId", StringComparison.InvariantCultureIgnoreCase)?.Value<int>();
					if (datatypeId != null)
					{
						this.Results.Add(new Entry(task.Id, task.Ancestors, task.Keys, new Models.Model(obj)));
					}
				}
				else
				{
					JProperty field = task.Json.First as JProperty;
					while (field != null)
					{
						Tasks.Push(new Task(task.Id, task.Ancestors, task.PropertyEditorAlias, field.Value, null, task.Keys, field.Name));
						field = field.Next as JProperty;
					}
				}
				return true;
			}
			else if (task.Json.Type == JTokenType.Array)
			{
				int count = 0;
				foreach (var token in task.Json.ToArray())
				{
					Tasks.Push(new Task(task.Id, task.Ancestors, task.PropertyEditorAlias, token, null, task.Keys, count));
					count++;
				}
				return true;
			}

			return false;
		}

		private bool IsTerratype(JObject json)
		{
			if (json is null)
			{
				return false;
			}

			var position = json.GetValue(Json.PropertyName<Models.Model>(nameof(Models.Model.Position)), StringComparison.InvariantCultureIgnoreCase);
            if (position == null)
            {
				return false;
			}
			var field = position.First as JProperty;
			var matches = 0;
            while (field != null)
            {
                if (String.Equals(field.Name, Json.PropertyName<Models.Position>(nameof(Models.Position.Id)), StringComparison.InvariantCultureIgnoreCase))
				{
					var id = field.Value.ToObject<string>();
					if (!Models.Position.Register.ContainsKey(id))
					{
						return false;
					}
					matches++;
				}
                else if (String.Equals(field.Name, Json.PropertyName<Models.Position>(nameof(Models.Position._internalDatum)), StringComparison.InvariantCultureIgnoreCase))
				{
					if (string.IsNullOrWhiteSpace(field.Value.ToObject<string>()))
					{
						return false;
					}
					matches++;
				}
				field = field.Next as JProperty;
			}
			return matches == 2;
		}

	}
}
