using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;

namespace Terratype.Indexer.Processors
{
	public class TerratypeProcessor : PropertyBase
	{
		public TerratypeProcessor(IList<Entry> results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, Terratype.TerratypePropertyEditor.PropertyEditorAlias, true) != 0 || task.Json.Type != JTokenType.Object)
			{
				return false;
			}

			var obj = task.Json as JObject;
			if ((int?) task.DataTypeId != null)
			{
				obj.Add(new JProperty("datatypeId", (int) task.DataTypeId));
			}
			this.Results.Add(new Entry(task.Id, task.Ancestors, task.Keys, new Models.Model(obj)));
			return true;
		}
	}
}
