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

		public override bool Add(IEnumerable<Entry> contents)
		{
            //throw new NotImplementedException();
			return false;
		}

		public override bool Delete(IEnumerable<Entry> contents)
		{
            throw new NotImplementedException();
		}

		public IEnumerable<Entry> Execute(AncestorSearchRequest request)
		{
            throw new NotImplementedException();
		}
    }
}
