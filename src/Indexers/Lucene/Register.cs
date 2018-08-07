using Umbraco.Core;

namespace Terratype.Indexers.Lucene
{
	public class Register : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Indexer.IndexerBase.RegisterType<Indexer.IndexerBase, Indexers.LuceneIndexer>(Indexers.LuceneIndexer._Id);
        }
	}
}
