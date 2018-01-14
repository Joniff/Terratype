using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Terratype.Indexer.ProcessorService
{
	public class Task
	{
		public string PropertyEditorAlias;
		public List<string> Keys; 
		public JToken Json;
		public DataTypeId DataTypeId;
	}
}
