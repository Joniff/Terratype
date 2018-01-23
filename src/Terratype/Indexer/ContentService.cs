using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;
using Umbraco.Core.Logging;

namespace Terratype.Indexer
{
	public class ContentService
	{
		private const string KeySeperator = ".";

		private string Identity(Umbraco.Core.Models.IContent content)
		{
			if (content.HasIdentity)
			{
				return content.Key.ToString();
			}
			return content.Path + KeySeperator + content.SortOrder.ToString() + KeySeperator + content.Name + KeySeperator + content.CreateDate.Ticks.ToString();
		}
		private IEnumerable<Guid> Ancestors(Umbraco.Core.Models.IContent content)
		{
			var results = new List<Guid>();
			foreach (var id in content.Path.Split(new char[] {','}).Select(x => int.Parse(x)).Where(x => x != Umbraco.Core.Constants.System.Root && x != content.Id))
			{
				var attempt = ApplicationContext.Current.Services.EntityService.GetKeyForId(id, Umbraco.Core.Models.UmbracoObjectTypes.Document);
				if (attempt.Success)
				{
					results.Insert(0, attempt.Result);
				}
				else
				{
					var parent = ApplicationContext.Current.Services.ContentService.GetById(id);
					results.Insert(0, parent.Key);
				}
			}
			return results;
		}

		public IEnumerable<Entry> Entries(IEnumerable<Umbraco.Core.Models.IContent> contents)
		{
			var results = new List<Entry>();
			var tasks = new Stack<Task>();

			var processors = new List<PropertyBase>
			{
				new Processors.TerratypeProcessor(results, tasks),
				new Processors.ArchetypeProcessor(results, tasks),
				new Processors.GridProcessor(results, tasks),
				new Processors.NestedContentProcessor(results, tasks),
				new Processors.StackedContentProcessor(results, tasks),
				new Processors.GenericProcessor(results, tasks)
			};

			foreach (var content in contents)
			{
				var keys = new List<string>
				{
					Identity(content)
				};

				var ancestor = Ancestors(content);

				foreach (var property in content.Properties.Where(x => x.Value is string))
				{
					if (Helper.IsJson(property.Value as string))
					{
						tasks.Push(new Task(content.Key, ancestor, property.PropertyType.PropertyEditorAlias, JToken.Parse(property.Value as string), 
							new DataTypeId(property.PropertyType.DataTypeDefinitionId), keys, property.PropertyType.Alias));
					}
				}
			}

			while (tasks.Any())
			{
				var task = tasks.Pop();

				foreach (var processor in processors)
				{
					try
					{
						if (processor.Process(task))
						{
							break;
						}
					}
					catch (Exception ex)
					{
						LogHelper.Error<ContentService>($"Error proccesing {task.Id} content node with {processor.GetType().Name}", ex);
					}
				}
			}

			return results;
		}
	}
}
