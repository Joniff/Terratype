using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer
{
	public abstract class IndexerBase : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<IndexerBase>(id, nameof(Indexer)); 

		public static IndexerBase Resolve(string id) => Resolve<IndexerBase>(id, nameof(Indexer)) as IndexerBase;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<IndexerBase>();

		public virtual bool MasterOnly => false;

		public abstract bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add);

		public static IEnumerable<Models.Model> Search(Searchers.ISearchRequest search)
		{
			//	See if we can find an indexer that can handle our request
			foreach (var id in InstalledTypes)
			{
				var indexer = Resolve(id);
				if (indexer != null && indexer.GetType().GetInterfaces().Any(x => x.GenericTypeArguments.Any(y => y.GUID == search.GetType().GUID)))
				{
					MethodInfo method = indexer.GetType().GetMethod(
						nameof(Searchers.IAncestorSearch<Searchers.AncestorSearchRequest>.Execute), 
						new Type[] {search.GetType()});
					if (method != null)
					{
						return method.Invoke(indexer, new object[] { search }) as IEnumerable<Models.Model>;
					}
				}
			}

            throw new NotImplementedException();
		}
	}
}
