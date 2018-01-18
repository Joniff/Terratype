using Umbraco.Core;

namespace Terratype.Indexer.Sql
{
	public class Register : ApplicationEventHandler
	{
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarted(umbracoApplication, applicationContext);

            new Persistance.Data.Migrations.Migration().RunMigrations(applicationContext.DatabaseContext.SqlSyntax, 
                applicationContext.Services.MigrationEntryService, applicationContext.ProfilingLogger.Logger);
		}		
	}
}
