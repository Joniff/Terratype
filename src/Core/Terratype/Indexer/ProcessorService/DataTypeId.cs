using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;

namespace Terratype.Indexer.ProcessorService
{
	public class DataTypeId
	{
		private int? constant;
		private Guid? constantGuid;
		private Func<object, int> caller;
		private Func<object, Guid> callerGuid;
		private object arg;

		public DataTypeId()
		{
		}
			
		public DataTypeId(int value)
		{
			constant = value;
		}

		public DataTypeId(Guid value)
		{
			constantGuid = value;
		}

		public DataTypeId(Func<object, int> c, object o)
		{
			caller = c;
			arg = o;
		}

		public DataTypeId(Func<object, Guid> c, object o)
		{
			callerGuid = c;
			arg = o;
		}

		public static implicit operator Nullable<int>(DataTypeId data)
		{
			if (data.constant != null)
			{
				return data.constant;
			}
			else if (data.caller != null)
			{
				data.constant = data.caller(data.arg);
			}
			else if (data.callerGuid != null)
			{
				data.constantGuid = data.callerGuid(data.arg);
			}
			if (data.constantGuid != null)
			{
				return data.constant = ApplicationContext.Current.Services.DataTypeService.GetDataTypeDefinitionById((Guid) data.constantGuid).Id;
			}
			return data.constant;
		}

		public static implicit operator Nullable<Guid>(DataTypeId data)
		{
			if (data.constantGuid != null)
			{
				return data.constantGuid;
			}
			else if (data.callerGuid != null)
			{
				data.constantGuid = data.callerGuid(data.arg);
			}
			else if (data.caller != null)
			{
				data.constant = data.caller(data.arg);
			}
			if (data.constant != null)
			{
				return data.constantGuid = ApplicationContext.Current.Services.DataTypeService.GetDataTypeDefinitionById((int) data.constant).Key;
			}
			return data.constantGuid;
		}
	}
}
