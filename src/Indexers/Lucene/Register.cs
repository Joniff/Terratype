using Terratype.Indexer;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Indexers.Lucene
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			composition.Register<IIndexer, LuceneIndexer>();
		}
	}
}
