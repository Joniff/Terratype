using System;
using System.Collections.Generic;

namespace Terratype.Indexer
{
	public class LuceneIndexer : Index
    {
        public override string Id => "Terratype.Indexer.Lucene";

		public override bool MasterOnly => false;


		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
            throw new NotImplementedException();
		}
    }
}
