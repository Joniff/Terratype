using System;
using System.Collections.Generic;
using Terratype.Indexer;

namespace Terratype.Indexers
{
	public class ElasticsearchIndexer : IndexerBase
    {
        public const string _Id = "Terratype.Indexer.Elasticsearch";
		public override string Id => _Id;
		public override bool MasterOnly => true;

		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
            throw new NotImplementedException();
		}
	}
}
