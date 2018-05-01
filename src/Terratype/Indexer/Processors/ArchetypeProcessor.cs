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

		private IDictionary<string, IDictionary<string, Umbraco.Core.Models.IDataTypeDefinition>> Definitions(int dataTypeId)
		{
			var results = new Dictionary<string, IDictionary<string, Umbraco.Core.Models.IDataTypeDefinition>>();
			var definitions = ApplicationContext.Current.Services.DataTypeService.GetPreValuesByDataTypeId((int) dataTypeId);
			if (definitions == null || !definitions.Any())
			{
				return null;
			}

			var config = JToken.Parse(definitions.FirstOrDefault());
			if (config.Type != JTokenType.Object)
			{
				return null;
			}
			
			var fieldsets = ((JObject) config).GetValue("fieldsets", StringComparison.InvariantCultureIgnoreCase);
			if (fieldsets == null || fieldsets.Type != JTokenType.Array)
			{
				return null;
			}

			foreach (var fieldset in fieldsets.ToArray())
			{
				if (fieldset.Type != JTokenType.Object)
				{
					continue;
				}

				var alias = ((JObject)fieldset).GetValue("alias", StringComparison.InvariantCultureIgnoreCase);
				if (alias == null || alias.Type != JTokenType.String)
				{
					continue;
				}

				var properties = ((JObject)fieldset).GetValue("properties", StringComparison.InvariantCultureIgnoreCase);
				if (properties == null || properties.Type != JTokenType.Array)
				{
					continue;
				}

				var innerResults = new Dictionary<string, Umbraco.Core.Models.IDataTypeDefinition>();
				foreach (var prop in properties)
				{
					var name = ((JObject)prop).GetValue("alias", StringComparison.InvariantCultureIgnoreCase);
					var dataTypeGuid = ((JObject)prop).GetValue("dataTypeGuid", StringComparison.InvariantCultureIgnoreCase);
					Guid dataType;
					if (name == null || dataTypeGuid == null || name.Type != JTokenType.String || dataTypeGuid.Type != JTokenType.String ||
						!Guid.TryParse(dataTypeGuid.Value<string>(), out dataType))
					{
						continue;
					}
					innerResults.Add(name.Value<string>(), ApplicationContext.Current.Services.DataTypeService.GetDataTypeDefinitionById(dataType));
				}
				results.Add(alias.Value<string>(), innerResults);
			}
			return results;
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Imulus.Archetype", true) != 0 || 
				task.Json.Type != JTokenType.Object || ((int?) task.DataTypeId) == null)
			{
				return false;
			}

			var definitions = Definitions((int) task.DataTypeId);

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
						var idType = obj.GetValue("id", StringComparison.InvariantCultureIgnoreCase);
						var props = obj.GetValue("properties", StringComparison.InvariantCultureIgnoreCase);
						var defName = obj.GetValue("alias", StringComparison.InvariantCultureIgnoreCase);
						var disabled = obj.GetValue("disabled", StringComparison.InvariantCultureIgnoreCase);

						if (idType == null || idType.Type != JTokenType.String || 
							props == null || props.Type != JTokenType.Array || 
							defName == null || defName.Type != JTokenType.String || 
							disabled == null || disabled.Type != JTokenType.Boolean)
						{
							continue;
						}

						var id = idType.Value<string>();

						IDictionary<string, Umbraco.Core.Models.IDataTypeDefinition> def;
						if (!definitions.TryGetValue(defName.Value<string>(), out def))
						{
							continue;
						}

						foreach (var prop in props)
						{
							if (prop.Type != JTokenType.Object)
							{
								continue;
							}
							var propObj = prop as JObject;
							var value = propObj.GetValue("value", StringComparison.InvariantCultureIgnoreCase);
							if (value == null)
							{
								continue;
							}
							if (value.Type == JTokenType.String)
							{
								var valueString = value.Value<string>();
								if (Helper.IsJson(valueString))
								{
									value = JToken.Parse(valueString);
								}
							}
							if (value.Type == JTokenType.Array || value.Type == JTokenType.Object)
							{
								var aliasType = propObj.GetValue("alias", StringComparison.InvariantCultureIgnoreCase);
								if (aliasType.Type != JTokenType.String)
								{
									continue;
								}
								var alias = aliasType.Value<string>();
								Umbraco.Core.Models.IDataTypeDefinition aliasDef;
								if (alias == null || !def.TryGetValue(alias, out aliasDef))
								{
									continue;
								}

								Tasks.Push(new Task(task.Id, task.Ancestors, aliasDef.PropertyEditorAlias, value,
									new DataTypeId(aliasDef.Id), task.Keys, id, alias));
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
