using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Terratype.Indexer.ProcessorService
{
	public abstract class PropertyBase
	{
		public IList<Entry> Results { get; internal set; }
		public Stack<Task> Tasks { get; internal set; }

		public PropertyBase(IList<Entry> results, Stack<Task> tasks)
		{
			Results = results;
			Tasks = tasks;
		}

		public virtual bool Process(Task task)
		{
			return false;
		}
	}
}
