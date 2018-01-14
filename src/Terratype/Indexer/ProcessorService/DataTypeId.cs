using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer.ProcessorService
{
	public class DataTypeId
	{
		private int? constant;
		private Func<object, int> caller;
		private object arg;

		public DataTypeId()
		{
		}
			
		public DataTypeId(int value)
		{
			constant = value;
		}

		public DataTypeId(Func<object, int> c, object o)
		{
			caller = c;
			arg = o;
		}

		public static implicit operator Nullable<int>(DataTypeId data)
		{
			if (data.constant != null)
			{
				return data.constant;
			}
			if (data.caller != null)
			{
				data.constant = data.caller(data.arg);
			}
			return data.constant;
		}
	}
}
