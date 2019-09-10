using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Terratype.DataEditors.Map;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core.Services;

namespace Terratype.Indexer.Processors
{
	public class TerratypeProcessor : PropertyBase
	{
		public TerratypeProcessor(IList<Entry> results, Stack<Task> tasks, IDataTypeService dataTypeService) : base(results, tasks, dataTypeService)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, MapDataEditor.DataEditorAlias, true) != 0 || task.Json.Type != JTokenType.Object)
			{
				return false;
			}

			var obj = task.Json as JObject;
			if ((int?) task.DataTypeId != null)
			{
				obj.Add(new JProperty("datatypeId", (int) task.DataTypeId));
			}
			this.Results.Add(new Entry(task.Id, task.Ancestors, task.Keys, new Models.Map(obj)));
			return true;
		}
	}
}
