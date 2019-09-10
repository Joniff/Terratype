using System;
using System.Collections.Generic;
using Terratype.Indexer;

namespace Terratype.Indexers
{
	public class LuceneIndexer : IndexerBase
	{
		public const string _Id = "Terratype.Indexer.Lucene";
		public override string Id => _Id;
		public override string Name => _Id;
		public override string Description => _Id;

		public override bool MasterOnly => true;


		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
			throw new NotImplementedException();
		}
	}
}
