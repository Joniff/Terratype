using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Indexers.Lucene
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Indexer.IndexerBase, LuceneIndexer>(LuceneIndexer._Id);
		}
	}
}
