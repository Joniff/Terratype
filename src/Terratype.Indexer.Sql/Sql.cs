using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer
{
    public class Sql : Terratype.Models.Indexer
    {
        public override string Id
        {
            get
            {
                return "Terratype.Indexer.Sql";
            }
        }

		public override bool Add(string key, Terratype.Models.Model model, IEnumerable<string> ancestors)
		{
            //throw new NotImplementedException();
			return false;
		}

		public override bool Delete(string key)
		{
            throw new NotImplementedException();
		}

		public override IEnumerable<Terratype.Models.Model> Search(string ancestor)
		{
            throw new NotImplementedException();
		}
    }
}
