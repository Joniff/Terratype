using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Terratype.Discover;
using Umbraco.Core.Composing;

namespace Terratype.Indexer
{
	public abstract class IndexerBase : DiscoverBase, IIndexer
	{
		public virtual bool MasterOnly => false;

		public abstract bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add);

		public static IEnumerable<IMap> Search(Searchers.ISearchRequest search)
		{
			//	See if we can find an indexer that can handle our request
			foreach (var indexer in IndexerBase.GetAllInstances<IIndexer>())
			{
				if (indexer != null && indexer.GetType().GetInterfaces().Any(x => x.GenericTypeArguments.Any(y => y.GUID == search.GetType().GUID)))
				{
					MethodInfo method = indexer.GetType().GetMethod(
						nameof(Searchers.IAncestorSearch<Searchers.AncestorSearchRequest>.Execute), 
						new Type[] {search.GetType()});
					if (method != null)
					{
						return method.Invoke(indexer, new object[] { search }) as IEnumerable<Map>;
					}
				}
			}

			throw new NotImplementedException();
		}

		IEnumerable<IMap> IIndexer.Search(Searchers.ISearchRequest search) => Search(search);
	}
}
