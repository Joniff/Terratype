using Umbraco.Core;

namespace Terratype.Indexers.Elasticsearch
{
	public class Register : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Indexer.IndexerBase.RegisterType<Indexer.IndexerBase, Indexers.ElasticsearchIndexer>(Indexers.ElasticsearchIndexer._Id);
        }
	}
}
