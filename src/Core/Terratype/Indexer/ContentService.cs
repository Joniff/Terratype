using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core.Logging;
using Umbraco.Core.Services;

namespace Terratype.Indexer
{
	public class ContentService
	{
		IEntityService EntityService;
		IContentService UmbracoContentService;
		IDataTypeService DataTypeService;
		IContentTypeService ContentTypeService;
		ILogger Logger;

		private const string KeySeperator = ".";

		public ContentService(IEntityService entityService, IContentService contentService, IDataTypeService dataTypeService, IContentTypeService contentTypeService, ILogger logger)
		{
			EntityService = entityService;
			UmbracoContentService = contentService;
			DataTypeService = dataTypeService;
			ContentTypeService = contentTypeService;
			Logger = logger;
		}

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
				var attempt = EntityService.GetKey(id, Umbraco.Core.Models.UmbracoObjectTypes.Document);
				if (attempt.Success)
				{
					results.Insert(0, attempt.Result);
				}
				else
				{
					var parent = UmbracoContentService.GetById(id);
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
				new Processors.TerratypeProcessor(results, tasks, DataTypeService),
				new Processors.ArchetypeProcessor(results, tasks, DataTypeService),
				new Processors.GridProcessor(results, tasks, DataTypeService),
				new Processors.NestedContentProcessor(results, tasks, ContentTypeService, DataTypeService),
				new Processors.StackedContentProcessor(results, tasks, ContentTypeService, DataTypeService),
				new Processors.GenericProcessor(results, tasks, DataTypeService)
			};

			foreach (var content in contents)
			{
				var keys = new List<string>
				{
					Identity(content)
				};

				var ancestor = Ancestors(content);

				foreach (var property in content.Properties)
				{
					foreach (var val in property.Values.Where(x => x.PublishedValue is string))
					{
						if (Helper.IsJson(val.PublishedValue as string))
						{
							tasks.Push(new Task(content.Key, ancestor, property.PropertyType.PropertyEditorAlias, JToken.Parse(val.PublishedValue as string),
								new DataTypeId(property.PropertyType.DataTypeId, DataTypeService), keys, property.PropertyType.Alias));
						}
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
						Logger.Error<ContentService>($"Error proccesing {task.Id} content node with {processor.GetType().Name}", ex);
					}
				}
			}

			return results;
		}
	}
}
