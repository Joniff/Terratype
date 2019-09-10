using System.Collections.Generic;
using Umbraco.Core.Services;

namespace Terratype.Indexer.ProcessorService
{
	public abstract class PropertyBase
	{
		public IList<Entry> Results { get; internal set; }
		public Stack<Task> Tasks { get; internal set; }

		protected IDataTypeService DataTypeService;

		public PropertyBase(IList<Entry> results, Stack<Task> tasks, IDataTypeService dataTypeService)
		{
			Results = results;
			Tasks = tasks;
			DataTypeService = dataTypeService;
		}

		public virtual bool Process(Task task)
		{
			return false;
		}
	}
}
