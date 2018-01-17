using System;
using System.Collections.Generic;

namespace Terratype.Indexer
{
	public class Lucene : Index
    {
        public override string Id
        {
            get
            {
                return "Terratype.Indexer.Lucene";
            }
        }

		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
            throw new NotImplementedException();
		}
    }
}
