using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Indexers.Elasticsearch
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Indexer.IndexerBase, ElasticsearchIndexer>(ElasticsearchIndexer._Id);
		}
	}
}
