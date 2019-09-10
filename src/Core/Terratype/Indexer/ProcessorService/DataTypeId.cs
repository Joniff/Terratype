using System;
using Umbraco.Core.Services;
using Umbraco.Core.Services.Implement;

namespace Terratype.Indexer.ProcessorService
{
	public class DataTypeId
	{
		private int? constant;
		private Guid? constantGuid;
		private Func<object, int> caller;
		private Func<object, Guid> callerGuid;
		private object arg;
		private IDataTypeService DataTypeService;

		public DataTypeId(IDataTypeService dataTypeService)
		{
			DataTypeService = dataTypeService;
		}
			
		public DataTypeId(int value, IDataTypeService dataTypeService) : this(dataTypeService)
		{
			constant = value;
		}

		public DataTypeId(Guid value, IDataTypeService dataTypeService) : this(dataTypeService)
		{
			constantGuid = value;
		}

		public DataTypeId(Func<object, int> c, object o, IDataTypeService dataTypeService) : this(dataTypeService)
		{
			caller = c;
			arg = o;
		}

		public DataTypeId(Func<object, Guid> c, object o, IDataTypeService dataTypeService) : this(dataTypeService)
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
				//return data.constant = DataTypeService..GetDataTypeDefinitionById((Guid) data.constantGuid).Id;
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
				// TODO
				//return data.constantGuid = ApplicationContext.Current.Services.DataTypeService.GetDataTypeDefinitionById((int) data.constant).Key;
			}
			return data.constantGuid;
		}
	}
}
