using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core;

namespace Terratype.Indexer.Processors
{
	public class NestedContentProcessor : PropertyBase
	{
		public NestedContentProcessor(IList<Entry> results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		private Dictionary<string, Umbraco.Core.Models.IContentType> cacheContentTypes = new Dictionary<string, Umbraco.Core.Models.IContentType>();
		private Umbraco.Core.Models.IContentType ContentType(string contentTypeAlias)
		{
			Umbraco.Core.Models.IContentType contentType;
			if (!cacheContentTypes.TryGetValue(contentTypeAlias, out contentType))
			{
				contentType = ApplicationContext.Current.Services.ContentTypeService.GetContentType(contentTypeAlias);
				cacheContentTypes.Add(contentTypeAlias, contentType);
			}
			return contentType;
		}

		public override bool Process(Task task)
		{
			if ((string.Compare(task.PropertyEditorAlias, "Our.Umbraco.NestedContent", true) != 0 && 
				string.Compare(task.PropertyEditorAlias, "Umbraco.NestedContent", true) != 0) || 
				task.Json.Type != JTokenType.Array)
			{
				return false;
			}

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
				foreach (var prop in ContentType(contentTypeAlias).CompositionPropertyTypes)
				{
					var value = obj.GetValue(prop.Alias, StringComparison.InvariantCultureIgnoreCase);

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
						Tasks.Push(new Task(task.Ancestors, prop.PropertyEditorAlias, value, new DataTypeId(prop.DataTypeDefinitionId), task.Keys, index, prop.Alias));
					}
				}
				index++;
			}

			return true;
		}
	}
}
