using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Umbraco.Core;
using Terratype.Indexer.ProcessorService;

namespace Terratype.Indexer.Processors
{
	public class Grid : PropertyBase
	{
		public Grid(Results results, Stack<Task> tasks) : base(results, tasks)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Umbraco.Grid", true) != 0 && 
				task.Json.Type != JTokenType.Object && task.DataTypeId != null)
			{
				return false;
			}
			
			//	TODO: Extract Terratypes

			return true;
		}
	}
}
