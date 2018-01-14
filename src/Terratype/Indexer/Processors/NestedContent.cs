using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;

namespace Terratype.Indexer.Processors
{
	public class NestedContent : PropertyBase
	{
		public NestedContent(Results results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Our.Umbraco.NestedContent", true) != 0 && 
				string.Compare(task.PropertyEditorAlias, "Umbraco.NestedContent", true) != 0 && 
				task.Json.Type != JTokenType.Array)
			{
				return false;
			}

			var cacheContentTypes = new Dictionary<string, Umbraco.Core.Models.IContentType>();
			var results = new Dictionary<string, Models.Model>();
			int index = 0;
			foreach (var token in task.Json.ToArray())
			{
				if (token.Type != JTokenType.Object)
				{
					continue;
				}

				var obj = token as JObject;
				var contentTypeAlias = obj.GetValue("ncContentTypeAlias", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
				if (string.IsNullOrWhiteSpace(contentTypeAlias))
				{
					continue;
				}
				Umbraco.Core.Models.IContentType contentType;
				if (!cacheContentTypes.TryGetValue(contentTypeAlias, out contentType))
				{
					contentType = ApplicationContext.Current.Services.ContentTypeService.GetContentType(contentTypeAlias);
					cacheContentTypes.Add(contentTypeAlias, contentType);
				}
				foreach (var prop in contentType.CompositionPropertyTypes)
				{
					var value = obj.GetValue(prop.Alias, StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
					if (string.IsNullOrWhiteSpace(value))
					{
						continue;
					}

					var newTask = new Task
					{
						PropertyEditorAlias = prop.PropertyEditorAlias,
						Keys = task.Keys,
						Json = value,
						DataTypeId = new DataTypeId(prop.DataTypeDefinitionId)
					};
					newTask.Keys.Add("[" + index.ToString() + "]"); 
					newTask.Keys.Add(prop.Alias);
					Tasks.Push(newTask);
				}
			}

			return true;
		}
	}
}
