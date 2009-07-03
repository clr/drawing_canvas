
def all_files
  [
    'pepper',
    'event',
    'interface',
    'style',
    'player',
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
    Dir.glob( File.join( 'doc', '*.xml' ) ).each do |file|
      File.open( File.join( 'doc', File.basename( file, '.xml' ) + '.json' ), 'wb') do |f|
        f.write( "{ l: [\n" );
        parser = XML::Parser.file( file )
        doc = parser.parse
        doc.find( '//line' ).each do |line|
          f.write( "{ " );
          f.write( "s: {" );
          f.write( " c: '##{ line.attributes['c'].to_i.to_s( 16 ) }'," );
          f.write( " o: #{ line.attributes['o'].to_f / 100 }," );
          f.write( " d: #{ line.attributes['t'].to_i } " );
          f.write( "}, " );
          f.write( "p: [" );
          line.find( 'p' ).each do |point|
            f.write( " [ #{ point.attributes['x'].to_i }, #{ point.attributes['y'].to_i } ]," );
          end
          f.write( " ] " );
          f.write( "},\n" );
        end
        f.write( "] }" );
      end
    end
  end

end

begin
  require "vlad"
  Vlad.load(:app => nil, :scm => "git")
rescue LoadError
  # do nothing
end

