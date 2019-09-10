using System;
using System.Collections.Generic;
using Terratype.Discover;

namespace Terratype.Indexer
{
	public interface IIndexer : IDiscover
	{
		bool MasterOnly { get; }

		bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add);

		IEnumerable<IMap> Search(Searchers.ISearchRequest search);
	}
}
