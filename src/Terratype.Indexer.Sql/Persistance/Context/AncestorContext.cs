using System;
using System.Collections.Generic;
using Umbraco.Core.Persistence;

namespace Terratype.Indexer.Sql.Persistance.Context
{
	internal class AncestorContext : DBContext
	{
		public void Write(Guid ancestor, string entryKey, DateTime lastModified)
		{
			var record = new Data.Dto.Ancestor
			{
				UmbracoNode = ancestor,
				Entry = entryKey,
				LastModified = lastModified
			};

			if (Database.SingleOrDefault<Data.Dto.Ancestor>(
				"WHERE " +
				nameof(Data.Dto.Ancestor.UmbracoNode) + " = @0 AND " +
				nameof(Data.Dto.Ancestor.Entry) + " = @1",
				ancestor, entryKey) == null)
			{
				Database.Insert(record);
			}
			else
			{
				Database.Update(record);
			}
		}

		public IEnumerable<Data.Dto.Entry> List(Guid ancestor)
		{
			return Database.Query<Data.Dto.Entry>(new Umbraco.Core.Persistence.Sql().Select("*").From<Data.Dto.Entry>(Syntax).Where<Data.Dto.Ancestor>(x => x.UmbracoNode == ancestor, Syntax));
		}

		public void Delete(Guid ancestor, DateTime? beforeThisDate = null)
		{
			var sql = new Umbraco.Core.Persistence.Sql().Where<Data.Dto.Ancestor>(x => x.UmbracoNode == ancestor, Syntax);
			if (beforeThisDate != null)
			{
				sql.Where<Data.Dto.Ancestor>(x => x.LastModified < beforeThisDate, Syntax);
			}

			Database.Delete<Data.Dto.Ancestor>(sql);
		}

		public void Delete(string entryKey)
		{
			Database.Delete<Data.Dto.Ancestor>(new Umbraco.Core.Persistence.Sql().Where<Data.Dto.Ancestor>(x => x.Entry == entryKey, Syntax));
		}
	}
}
