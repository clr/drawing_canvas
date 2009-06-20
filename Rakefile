
def all_files
  [
    'pepper',
    'event',
    'drawing',
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



