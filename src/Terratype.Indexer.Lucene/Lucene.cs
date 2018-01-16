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

		public override bool Add(IEnumerable<Entry> contents)
		{
            throw new NotImplementedException();
		}

		public override bool Delete(IEnumerable<Entry> contents)
		{
            throw new NotImplementedException();
		}
    }
}
