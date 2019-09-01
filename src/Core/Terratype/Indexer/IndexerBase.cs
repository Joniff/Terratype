using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Composing;

namespace Terratype.Indexer
{
	public abstract class IndexerBase : IDiscoverable
	{
		public virtual bool MasterOnly => false;

		public abstract bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add);

		public static IEnumerable<Models.Map> Search(Searchers.ISearchRequest search)
		{
			//	See if we can find an indexer that can handle our request
			var container = new LightInject.ServiceContainer();
			var indexers = container.GetAllInstances(typeof(IndexerBase));
			foreach (var indexer in indexers)
			{
				if (indexer != null && indexer.GetType().GetInterfaces().Any(x => x.GenericTypeArguments.Any(y => y.GUID == search.GetType().GUID)))
				{
					MethodInfo method = indexer.GetType().GetMethod(
						nameof(Searchers.IAncestorSearch<Searchers.AncestorSearchRequest>.Execute), 
						new Type[] {search.GetType()});
					if (method != null)
					{
						return method.Invoke(indexer, new object[] { search }) as IEnumerable<Models.Map>;
					}
				}
			}

			throw new NotImplementedException();
		}
	}
}
