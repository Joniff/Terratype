using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;

namespace Terratype.Indexer.Processors
{
	public class Archetype : PropertyBase
	{
		public Archetype(Results results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Imulus.Archetype", true) != 0 && 
				task.Json.Type != JTokenType.Object && task.DataTypeId != null)
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

							var alias = propObj.GetValue("alias", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
							var value = propObj.GetValue("value", StringComparison.InvariantCultureIgnoreCase);

							var newTask = new Task
							{
								PropertyEditorAlias = "",	//	TODO: Need to read value from definitions
								Keys = keysPlusId,
								Json = value,
								DataTypeId = new DataTypeId()	//	TODO: Need to read value from definitions
							};
							newTask.Keys.Add(alias);
							Tasks.Push(newTask);
						}
					}
				}
				field = field.Next as JProperty;
			}

			return true;
		}
	}
}
