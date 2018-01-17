using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer.Searchers
{
	public class AncestorSearchRequest : ISearchRequest
	{
		public Guid Ancestor { get; set; }
	}

	public interface IAncestorSearch<AncestorSearchRequest> : ISearch<ISearchRequest>
	{
		IEnumerable<Entry> Execute(AncestorSearchRequest request);
	}
}
