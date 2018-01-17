using System;
using System.Collections.Generic;
using Terratype.Indexer.Searchers;

namespace Terratype.Indexer
{
	public class Sql : Index, IAncestorSearch<AncestorSearchRequest>
    {
        public override string Id
        {
            get
            {
                return "Terratype.Indexer.Sql";
            }
        }

		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
            //throw new NotImplementedException();
			return true;
		}

		public IEnumerable<Entry> Execute(AncestorSearchRequest request)
		{
            throw new NotImplementedException();
		}
    }
}
