using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core.Services;

namespace Terratype.Indexer.Processors
{
	public class StackedContentProcessor : PropertyBase
	{
		IContentTypeService ContentTypeService;

		public StackedContentProcessor(IList<Entry> results, Stack<Task> tasks, IContentTypeService contentTypeService, IDataTypeService dataTypeService) : base(results, tasks, dataTypeService)
		{
			ContentTypeService = contentTypeService;
		}

		private Dictionary<string, Umbraco.Core.Models.IContentType> cacheContentTypes = new Dictionary<string, Umbraco.Core.Models.IContentType>();
		private Umbraco.Core.Models.IContentType ContentType(string contentTypeAlias)
		{
			Umbraco.Core.Models.IContentType contentType;
			if (!cacheContentTypes.TryGetValue(contentTypeAlias, out contentType))
			{
				contentType = ContentTypeService.Get(contentTypeAlias);
				cacheContentTypes.Add(contentTypeAlias, contentType);
			}
			return contentType;
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Our.Umbraco.StackedContent", true) != 0 || 
				task.Json.Type != JTokenType.Array)
			{
				return false;
			}

			var results = new Dictionary<string, Models.Map>();
			foreach (var token in task.Json.ToArray())
			{
				if (token.Type != JTokenType.Object)
				{
					continue;
				}

				var obj = token as JObject;
				var contentTypeAlias = obj.GetValue("icContentTypeAlias", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
				var tokenKey = obj.GetValue("key", StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
				if (string.IsNullOrWhiteSpace(contentTypeAlias) || string.IsNullOrWhiteSpace(tokenKey))
				{
					continue;
				}
				foreach (var prop in ContentType(contentTypeAlias).CompositionPropertyTypes)
				{
					var value = obj.GetValue(prop.Alias, StringComparison.InvariantCultureIgnoreCase);
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
						Tasks.Push(new Task(task.Id, task.Ancestors, prop.PropertyEditorAlias, value, new DataTypeId(prop.DataTypeId, DataTypeService), task.Keys, tokenKey, prop.Alias));
					}
				}
			}

			return true;
		}
	}
}
