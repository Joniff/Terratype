using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Umbraco.Core.Persistence;

namespace Terratype.Indexers.Sql.Persistance.Context
{
	internal class EntryContext : DBContext
	{
		public void Write(string entryKey, Guid umbracoNode, Terratype.Models.Model map, DateTime lastModified)
		{
			var entry = Database.SingleOrDefault<Data.Dto.Entry>(
				"WHERE " +
				nameof(Data.Dto.Entry.Identifier) + " = @0",
				entryKey);

			var wgs84 = map.Position.ToWgs84();
			var json = JsonConvert.SerializeObject(map);
			if (entry == null)
			{
				entry = new Data.Dto.Entry
				{
					Identifier = entryKey,
					UmbracoNode = umbracoNode,
					Map = json,
					Latitude = wgs84.Latitude,
					Longitude = wgs84.Longitude,
					LastModified = lastModified
				};
				Database.Insert(nameof(Terratype) + nameof(Indexers) + nameof(Sql) + nameof(Data.Dto.Entry), nameof(Data.Dto.Entry.Identifier), false, entry);
			}
			else
			{
				entry.UmbracoNode = umbracoNode;
				entry.Map = json;
				entry.Latitude = wgs84.Latitude;
				entry.Longitude = wgs84.Longitude;
				entry.LastModified = lastModified;
				Database.Update(entry);
			}
		}

		public IEnumerable<Data.Dto.Entry> List(Guid umbracoNode)
		{
			return Database.Query<Data.Dto.Entry>(new Umbraco.Core.Persistence.Sql().Select("*").From<Data.Dto.Entry>(Syntax).Where<Data.Dto.Ancestor>(x => x.UmbracoNode == umbracoNode, Syntax));
		}

		public void Delete(Guid umbracoNode, DateTime? beforeThisDate = null)
		{
			var sql = new Umbraco.Core.Persistence.Sql().Where<Data.Dto.Entry>(x => x.UmbracoNode == umbracoNode, Syntax);
			if (beforeThisDate != null)
			{
				sql.Where<Data.Dto.Entry>(x => x.LastModified < beforeThisDate, Syntax);
			}

			Database.Delete<Data.Dto.Entry>(sql);
		}

		public void Delete(Data.Dto.Entry entry)
		{
			Database.Delete<Data.Dto.Ancestor>(new Umbraco.Core.Persistence.Sql().Where<Data.Dto.Ancestor>(x => x.Entry == entry.Identifier, Syntax));
		}
	}
}
