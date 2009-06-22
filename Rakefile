
def all_files
  [
    'pepper',
    'event',
    'drawing',
    'style',
    'canvas'
  ].collect{ |f| f + '.js' }
end

def license
  return <<-LICENSE
/*
 * drawing_canvas 0.4.71 - Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: #{ Date.today } #{ Time.now } $
 * $Rev: 1 more than last time $
 */
 
LICENSE
end

namespace :javascript do

  desc "Concatenate the files together."
  task :join do
    all_scripts = license
    all_files.each do |file|
      all_scripts << File.read( File.join( 'lib', file ) )
    end
    File.open( 'drawing_canvas.js', 'wb'){ |f| f.write( all_scripts ) }
  end

  desc "Minify the concatenated files."
  task :compress => :join do
    `./jsmin.rb <./drawing_canvas.js >./drawing_canvas.min.js`
  end

end

namespace :sketchfu do

  desc "Convert drawing files from XML to JSON."
  task :xml_to_json do
    gem 'libxml-ruby', '>= 0.8.3'
    require 'xml'
    all_scripts = license
    Dir.glob( File.join( 'doc', '*.xml' ) ).each do |file|
      File.open( File.join( 'doc', File.basename( file, 'xml' ) + '.json' ), 'wb') do |f|
        f.write( "{ lines: [\n" );
        parser = XML::Parser.new
        parser.string = File.read( file )
        doc = parser.parse
        doc.find( '/line' ).each do |line|
          f.write( "  {\n" );
          f.write( "    style: {\n" );
          f.write( "      color: #{ line[:c].to_f / 100 }\n" );
          f.write( "      opacity: #{ line[:o].to_f / 100 }\n" );
          f.write( "      size: #{ line[:t].to_i }\n" );
          f.write( "    }\n" );
          f.write( posts << p.attributes.inject({}) { |h, a| h[a.name] = a.value; h }
          end
          # pp posts
        }
        f.write( all_scripts )
      end
    end
  end
  //          style: {
  //            color: "#000000",
  //            opacity: 1.0,
  //            size: 2
  //     
  //        { 
  //          style: {}
  //          points: [
  //            [ x0, y0 ],
  //            [ x1, y1 ],
  //            ...
  //            [ xN, yN ]
  //          ]
  //        },
  //        {
  //          ...
  //        }
  //      ]
  //    } 

  desc "Minify the concatenated files."
  task :compress => :join do
    `./jsmin.rb <./drawing_canvas.js >./drawing_canvas.min.js`
  end

end



