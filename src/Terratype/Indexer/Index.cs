using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer
{
	public abstract class Index : Frisk.IFrisk
	{
        public abstract string Id { get; }

		public abstract bool MasterOnly { get; }

		public abstract bool Sync(IEnumerable<Guid> remove, IEnumerable<Entry> add);

        public static IDictionary<string, Type> Register
        {
            get
            {
                return Frisk.Frisk.Register<Index>();
            }
        }

		public static IEnumerable<Models.Model> Search(Searchers.ISearchRequest search)
		{
			//	See if we can find an indexer that can handle our request
			foreach (var index in Register)
			{
				if (index.Value.GetInterfaces().Any(x => x.GenericTypeArguments.Any(y => y.GUID == search.GetType().GUID)))
				{
					var indexer = Activator.CreateInstance(index.Value) as Index;
					if (indexer != null)
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
			}

            throw new NotImplementedException();
		}
	}
}
