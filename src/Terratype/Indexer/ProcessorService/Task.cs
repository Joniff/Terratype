using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Terratype.Indexer.ProcessorService
{
	public class Task
	{
		public Guid Id;
		public IEnumerable<Guid> Ancestors;
		public string PropertyEditorAlias;
		public List<string> Keys; 
		public JToken Json;
		public DataTypeId DataTypeId;

		public Task()
		{
		}

		public Task(Guid id, IEnumerable<Guid> ancestors, string propertyEditorAlias, JToken json, DataTypeId dataTypeId, List<string> keys, params object[] newKeys)
		{
			Id = id;
			Ancestors = ancestors;
			PropertyEditorAlias = propertyEditorAlias;
			Keys = new List<string>();
			Keys.AddRange(keys);
			foreach (var key in newKeys)
			{
				if (key is string)
				{
					Keys.Add((string) key);
				}
				else if (key is int)
				{
					Keys.Add("[" + ((int) key).ToString() + "]");
				}
				else
				{
					Keys.Add(key.ToString());
				}
			}
			Json = json;
			DataTypeId = dataTypeId;
		}
	}
}
