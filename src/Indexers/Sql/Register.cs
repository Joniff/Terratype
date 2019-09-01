using ClientDependency.Core.Logging;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Migrations;
using Umbraco.Core.Scoping;
using Umbraco.Core.Services;

namespace Terratype.Indexers.Lucene
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		IScopeProvider ScopeProvider;
		IMigrationBuilder MigrationBuilder;
		IKeyValueService KeyValueService;
		ILogger Logger;

		public Register(IScopeProvider scopeProvider, IMigrationBuilder migrationBuilder, IKeyValueService keyValueService, ILogger logger)
		{
			ScopeProvider = scopeProvider;
			MigrationBuilder = migrationBuilder;
			KeyValueService = keyValueService;
			Logger = logger;
		}

		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Indexer.IndexerBase, SqlIndexer>(SqlIndexer._Id);

			new Sql.Persistance.Data.Migrations.Migration().RunMigrations(applicationContext.DatabaseContext.SqlSyntax,
				applicationContext.Services.MigrationEntryService, applicationContext.ProfilingLogger.Logger);
		}
	}

	public class MyProjectUpgradeComponent : UmbracoUserComponent
	{
		public override Initialize(IScopeProvider scopeProvider, IMigrationBuilder migrationBuilder, IKeyValueService keyValueService, ILogger logger)
		{
			var plan = new MigrationPlan("MyProject");
			plan.From(string.Empty)
				.To<Migration1>("state-1")
				.To<Migration2>("state-2")
				.To<Migration3>("state-3");

			var upgrader = new Upgrader(plan);
			upgrader.Execute(scopeProvider, migrationBuilder, keyValueService, logger);
		}
	}
}


