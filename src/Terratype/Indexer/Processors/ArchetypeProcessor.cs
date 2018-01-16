using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;

namespace Terratype.Indexer.Processors
{
	public class ArchetypeProcessor : PropertyBase
	{
		public ArchetypeProcessor(IList<Entry> results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Imulus.Archetype", true) != 0 || 
				task.Json.Type != JTokenType.Object || ((int?) task.DataTypeId) == null)
			{
				return false;
			}

			var definitions = ApplicationContext.Current.Services.DataTypeService.GetPreValuesByDataTypeId((int) task.DataTypeId);

			var field = task.Json.First as JProperty;
			while (field != null)
			{
				if (string.Compare(field.Name , "fieldsets", true) == 0 && field.Value.Type == JTokenType.Array)
				{
					foreach (var token in field.Value.ToArray())
					{
						if (token.Type != JTokenType.Object)
						{
							continue;
						}
					
						var obj = token as JObject;
						var id = obj.GetValue("id", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
						var props = obj.GetValue("id", StringComparison.InvariantCultureIgnoreCase);
						
						var keysPlusId = task.Keys;
						keysPlusId.Add(id); 

						foreach (var prop in props)
						{
							if (prop.Type != JTokenType.Object)
							{
								continue;
							}
							var propObj = prop as JObject;

							var value = propObj.GetValue("value", StringComparison.InvariantCultureIgnoreCase);
							if (value.Type == JTokenType.Array || value.Type == JTokenType.Object)
							{
								var alias = propObj.GetValue("alias", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
								Tasks.Push(new Task(task.Ancestors, alias, value, new DataTypeId(), keysPlusId, alias));
							}
						}
					}
				}
				field = field.Next as JProperty;
			}

			return true;
		}
	}
}
