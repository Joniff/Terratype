using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer
{
    public class Elasticsearch : Index
    {
        public override string Id
        {
            get
            {
                return "Terratype.Indexer.Elasticsearch";
            }
        }

		public override bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add)
		{
            throw new NotImplementedException();
		}
	}
}
