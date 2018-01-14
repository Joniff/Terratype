using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;

namespace Terratype.Indexer
{
	public class ContentService
	{
		private Models.Indexer Indexer;
		private const string KeySeperator = ".";

		public ContentService(Models.Indexer indexer)
		{
			Indexer = indexer;
		}

		private string Identity(Umbraco.Core.Models.IContent content)
		{
			if (content.HasIdentity)
			{
				return content.Key.ToString();
			}
			return content.Path + KeySeperator + content.SortOrder.ToString() + KeySeperator + content.Name + KeySeperator + content.CreateDate.Ticks.ToString();
		}

		private bool IsJson(string json)
		{
            json = json.Trim();
			var end = json.Length - 1;
            return (json[0] == '{' && json[end] == '}') || 
				(json[0] == '[' && json[end] == ']');
		}

		public Results Execute(string key, Umbraco.Core.Models.IContent content)
		{
			var results = new Results();
			var tasks = new Stack<Task>();

			var processors = new List<PropertyBase>
			{
				new Processors.Archetype(results, tasks),
				new Processors.Grid(results, tasks),
				new Processors.NestedContent(results, tasks),
				new Processors.Generic(results, tasks)
			};
			var keys = new List<string>
			{
				key
			};

			foreach (var property in content.Properties.Where(x => x.Value is string))
			{
				if (IsJson(property.Value as string))
				{
					var task = new Task
					{
						PropertyEditorAlias = property.PropertyType.PropertyEditorAlias,
						Keys = keys,
						Json = JObject.Parse(property.Value as string),
						DataTypeId = new DataTypeId(property.PropertyType.DataTypeDefinitionId)
					};
					task.Keys.Add(property.PropertyType.Alias);
					tasks.Push(task);
				}
			}

			while (tasks.Any())
			{
				var task = tasks.Pop();

				foreach (var processor in processors)
				{
					if (processor.Process(task))
					{
						break;
					}
				}
			}

			return results;
		}

		private IEnumerable<string> Ancestors(Umbraco.Core.Models.IContent content)
		{
			var results = new List<string>();
			foreach (var id in content.Path.Split(new char[] {','}).Select(x => int.Parse(x)).Where(x => x != Umbraco.Core.Constants.System.Root))
			{
				var attempt = ApplicationContext.Current.Services.EntityService.GetKeyForId(id, Umbraco.Core.Models.UmbracoObjectTypes.ContentItem);
				if (attempt.Success)
				{
					results.Insert(0, attempt.Result.ToString());
				}
				else
				{
					results.Insert(0, id.ToString());
				}
			}
			return results;
		}
		public void Save(Umbraco.Core.Models.IContent content)
		{
			var found = Execute(Identity(content), content);
			if (!found.Any())
			{
				return;
			}

			var ancestors = Ancestors(content);
			foreach (var model in found)
			{
				Indexer.Add(model.Key, model.Value, ancestors);
			}
		}

		public void Delete(Umbraco.Core.Models.IContent content)
		{
			foreach (var model in Execute(Identity(content), content))
			{
				Indexer.Delete(model.Key);
			}
		}
	}
}
