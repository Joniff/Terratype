using System;
using System.Collections.Generic;
using System.Linq;
using Terratype.Indexer;
using Terratype.Indexer.Searchers;
using Terratype.Indexers.Sql.Persistance.Context;
using Umbraco.Core.Logging;

namespace Terratype.Indexers
{
	public class SqlIndexer : IndexerBase, IAncestorSearch<AncestorSearchRequest>
	{
		public const string _Id = "Terratype.Indexer.Sql";
		public override string Id => _Id;

		public override bool MasterOnly => true;

		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
			var ancestorDb = new AncestorContext();
			var entryDb = new EntryContext();

			try
			{
				entryDb.Database.BeginTransaction();

				var now = DateTime.UtcNow;

				if (add != null)
				{
					foreach (var entry in add)
					{
						entryDb.Write(entry.Key, entry.Id, entry.Map, now);
						ancestorDb.Write(entry.Id, entry.Key, now);
						foreach (var ancestor in entry.Ancestors)
						{
							ancestorDb.Write(ancestor, entry.Key, now);
						}
					}
				}

				if (remove != null)
				{
					foreach (var guid in remove)
					{
						ancestorDb.Delete(guid, now);
						entryDb.Delete(guid, now);
					}
				}
				entryDb.Database.CompleteTransaction();
				return true;
			}
			catch (Exception ex)
			{
				LogHelper.Error<SqlIndexer>($"Error trying to sync content with indexer", ex);
			}

			try
			{
				entryDb.Database.AbortTransaction();
			}
			catch (Exception)
			{
				//	Just swallow the error, as the previous catch above would have logged it
			}
			return false;
		}

		public IEnumerable<Models.Model> Execute(AncestorSearchRequest request)
		{
			return new AncestorContext().List(request.Ancestor).Select(x => new Models.Model(x.Map));
		}
	}
}
