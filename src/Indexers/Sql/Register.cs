using Umbraco.Core;

namespace Terratype.Indexers.Sql
{
	public class Register : ApplicationEventHandler
	{
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarted(umbracoApplication, applicationContext);
			Indexer.IndexerBase.RegisterType<Indexer.IndexerBase, Indexers.SqlIndexer>(Indexers.SqlIndexer._Id);

            new Persistance.Data.Migrations.Migration().RunMigrations(applicationContext.DatabaseContext.SqlSyntax, 
                applicationContext.Services.MigrationEntryService, applicationContext.ProfilingLogger.Logger);
		}		
	}
}
