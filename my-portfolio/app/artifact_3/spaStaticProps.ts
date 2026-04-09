import { GetStaticProps } from 'next';
import { ArtifactData } from '../utility/ArtifactData';
import { codeToHtml } from 'shiki';

export const getSpaCode = async(): Promise<ArtifactData> => {

    // Different sections use different languages. Classes are mapped to a
    // shiki language so each snippet gets highlighted against the correct grammar.
    const langMap: { [className: string]: string } = {
        'Alert Model': 'javascript',
        'Alerts Controller': 'javascript',
        'Routes': 'javascript',
        'Authentication Controller': 'javascript',
        'User Model': 'javascript',
        'Passport Config': 'javascript',
        'JWT Interceptor': 'typescript',
        'Alert Data Service': 'typescript',
        'Alert Listing Component': 'typescript',
        'Alert Listing Template': 'html'
    }

    const highlight = async (code: string, lang: string) => {
        return await codeToHtml(code, {
            lang: lang,
            theme: 'ayu-dark'
        })
    }

    const spaCode: ArtifactData = {
        'Alert Model': {
            'Schema': {
                "content": "const mongoose = require('mongoose');\n\n" +
                    "// Define alert schema\n" +
                    "const alertSchema = new mongoose.Schema({\n" +
                    "\tsource: {type: String, required: true},\n" +
                    "\tsource_port: {type: Number, required: true},\n" +
                    "\tdestination: {type: String, required: true},\n" +
                    "\tdestination_port: {type: Number, required: true},\n" +
                    "\tcategory: {type: String, required: true, index: true},\n" +
                    "\treported: {type: Date, required: true},\n" +
                    "});\n" +
                    "const Alert = mongoose.model('alert', alertSchema);\n" +
                    "module.exports = Alert;"
            }
        },
        'Alerts Controller': {
            'List with Aggregation Pipeline': {
                "content": "// GET /alerts - paginated, filtered, sorted list via $match + $facet\n" +
                    "const alertsList = async(req, res) => {\n" +
                    "\ttry {\n" +
                    "\t\tconst page = parseInt(req.query.page) || 1;\n" +
                    "\t\tconst limit = parseInt(req.query.limit) || 25;\n" +
                    "\t\tconst sort = req.query.sort || 'reported';\n" +
                    "\t\tconst order = req.query.order == 'asc' ? 1 : -1;\n" +
                    "\t\tconst category = req.query.category;\n" +
                    "\t\tconst search = req.query.search;\n" +
                    "\t\tconst from = req.query.from;\n" +
                    "\t\tconst to = req.query.to;\n\n" +
                    "\t\tconst pipeline = [];\n" +
                    "\t\tconst match = {};\n" +
                    "\t\tif (category) match.category = category;\n" +
                    "\t\tif (search) {\n" +
                    "\t\t\tmatch.$or = [\n" +
                    "\t\t\t\t{ source: {$regex: search, $options: 'i'}},\n" +
                    "\t\t\t\t{ destination: { $regex: search, $options: 'i'}}\n" +
                    "\t\t\t];\n" +
                    "\t\t}\n" +
                    "\t\tif (from || to) {\n" +
                    "\t\t\tif (from) match.reported.$get = new Date(from);\n" +
                    "\t\t\tif (to) match.reported.$lte = new Date(to);\n" +
                    "\t\t}\n\n" +
                    "\t\tif (Object.keys(match).length > 0) {\n" +
                    "\t\t\tpipeline.push({$match: match});\n" +
                    "\t\t}\n\n" +
                    "\t\t// $facet returns both the page of results and the total count\n" +
                    "\t\t// in a single round-trip to Atlas\n" +
                    "\t\tpipeline.push({\n" +
                    "\t\t\t$facet: {\n" +
                    "\t\t\t\tmetadata: [{$count: 'total'}],\n" +
                    "\t\t\t\talerts: [\n" +
                    "\t\t\t\t\t{ $sort: { [sort]: order}},\n" +
                    "\t\t\t\t\t{ $skip: (page-1) * limit },\n" +
                    "\t\t\t\t\t{ $limit: limit }\n" +
                    "\t\t\t\t]\n" +
                    "\t\t\t}\n" +
                    "\t\t});\n\n" +
                    "\t\tconst [result] = await Model.aggregate(pipeline);\n" +
                    "\t\tconst total = result.metadata[0]?.total || 0;\n\n" +
                    "\t\treturn res.status(200).json({\n" +
                    "\t\t\talerts: result.alerts,\n" +
                    "\t\t\ttotal, page, limit,\n" +
                    "\t\t\tpages: Math.ceil(total/limit)\n" +
                    "\t\t});\n" +
                    "\t} catch (err) {\n" +
                    "\t\treturn res.status(err.status || 400).json({message: err.message});\n" +
                    "\t}\n" +
                    "};"
            }
        },
        'Routes': {
            'Input Validation': {
                "content": "// Validation rule factory - every auth field must be\n" +
                    "// present, string, and trimmed before reaching the controller\n" +
                    "const validateParam = (param) => body(param).notEmpty().isString().trim();\n\n" +
                    "router.route('/register')\n" +
                    "\t.post(\n" +
                    "\t\tvalidateParam('username'),\n" +
                    "\t\tvalidateParam('password'),\n" +
                    "\t\tauthController.register);\n\n" +
                    "router.route('/login')\n" +
                    "\t.post(\n" +
                    "\t\tvalidateParam('username'),\n" +
                    "\t\tvalidateParam('password'),\n" +
                    "\t\tauthController.login);"
            },
            'Dual Auth Routes': {
                "content": "// Same resource, two gatekeepers:\n" +
                    "//   dashboard reads via JWT cookie (authenticateJWT)\n" +
                    "//   Pi writes via bearer-secret header (authenticatePi)\n" +
                    "router\n" +
                    "\t.route('/alerts')\n" +
                    "\t.get(authenticateJWT, alertsController.alertsList)\n" +
                    "\t.post(authenticatePi, alertsController.alertsAddAlerts);\n\n" +
                    "router.route('/heartbeat')\n" +
                    "\t.get(authenticatePi, alertsController.heartBeat);"
            },
            'Authenticate JWT': {
                "content": "// Dashboard auth: read JWT out of httpOnly cookie and verify signature\n" +
                    "function authenticateJWT(req, res, next) {\n" +
                    "\tconst token = req.cookies.token;\n\n" +
                    "\tif (!token) {\n" +
                    "\t\treturn res.sendStatus(401);\n" +
                    "\t}\n\n" +
                    "\tjwt.verify(token, process.env.JWT_SECRET, (err, verified) => {\n" +
                    "\t\tif (err) {\n" +
                    "\t\t\treturn res.status(401).json('Token Validation Error!');\n" +
                    "\t\t}\n" +
                    "\t\treq.auth = verified;\n" +
                    "\t\tnext();\n" +
                    "\t});\n" +
                    "}"
            },
            'Authenticate Pi': {
                "content": "// Pi auth: compare Authorization header bearer secret to env var\n" +
                    "function authenticatePi(req, res, next) {\n" +
                    "\tconst authHeader = req.headers['authorization'];\n\n" +
                    "\tif (authHeader == null) {\n" +
                    "\t\treturn res.status(401).json({message: 'auth Header Required but NOT PRESENT!'});\n" +
                    "\t}\n\n" +
                    "\tconst secret = authHeader.split(' ')[1];\n\n" +
                    "\tif (secret == null) {\n" +
                    "\t\treturn res.status(401).json({message: 'Null Bearer Secret'});\n" +
                    "\t}\n\n" +
                    "\tconst verified = process.env.API_KEY == secret;\n" +
                    "\tif (!verified) {\n" +
                    "\t\treturn res.status(401).json({message: 'Wrong Bearer Secret'});\n" +
                    "\t}\n" +
                    "\tnext();\n" +
                    "}"
            }
        },
        'Authentication Controller': {
            'Login with httpOnly Cookie': {
                "content": "const login = async (req, res) => {\n" +
                    "\tconst result = validationResult(req);\n" +
                    "\tif (!result.isEmpty()) {\n" +
                    "\t\treturn res.status(401).json({'message': result.message, 'type': result.type});\n" +
                    "\t}\n\n" +
                    "\tpassport.authenticate('local', (err, user, info) => {\n" +
                    "\t\tif (err) return res.status(404).json(err);\n\n" +
                    "\t\tif (user) {\n" +
                    "\t\t\tconst expire = Math.floor(Date.now() / 1000) + 60 * 60;\n" +
                    "\t\t\tconst token = user.generateJWT();\n\n" +
                    "\t\t\t// httpOnly: true is the XSS mitigation -\n" +
                    "\t\t\t// JavaScript on the page cannot read this cookie\n" +
                    "\t\t\tres.cookie('token', token, {\n" +
                    "\t\t\t\thttpOnly: true,\n" +
                    "\t\t\t\tsecure: false,\n" +
                    "\t\t\t\tsameSite: 'strict',\n" +
                    "\t\t\t\tmaxAge: 60*60*1000\n" +
                    "\t\t\t});\n\n" +
                    "\t\t\treturn res.status(200).json({ username: user.username, expire: expire });\n" +
                    "\t\t} else {\n" +
                    "\t\t\tres.status(401).json(info);\n" +
                    "\t\t}\n" +
                    "\t})(req, res);\n" +
                    "};"
            }
        },
        'User Model': {
            'Schema with Plugin': {
                "content": "const mongoose = require('mongoose');\n" +
                    "const jwt = require('jsonwebtoken');\n" +
                    "const passportLocalMongoose = require('passport-local-mongoose').default\n" +
                    "\t\t\t\t\t\t\t\t|| require('passport-local-mongoose');\n\n" +
                    "const userSchema = new mongoose.Schema({});\n\n" +
                    "// Plugin adds username, salted hash, register(), and Passport strategy\n" +
                    "userSchema.plugin(passportLocalMongoose);\n\n" +
                    "userSchema.methods.generateJWT = function() {\n" +
                    "\treturn jwt.sign(\n" +
                    "\t\t{ _id: this._id, username: this.username },\n" +
                    "\t\tprocess.env.JWT_SECRET,\n" +
                    "\t\t{ expiresIn: '1h' });\n" +
                    "};\n\n" +
                    "const User = mongoose.model('users', userSchema);\n" +
                    "module.exports = User;"
            }
        },
        'Passport Config': {
            'Create Strategy': {
                "content": "const passport = require('passport');\n" +
                    "const User = require('../models/user');\n\n" +
                    "// The passport-local-mongoose plugin provides this strategy\n" +
                    "// - no hand-written salt/hash/verify methods required\n" +
                    "passport.use(User.createStrategy());"
            }
        },
        'JWT Interceptor': {
            'With Credentials': {
                "content": "import { inject } from '@angular/core';\n" +
                    "import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';\n" +
                    "import { HttpInterceptorFn } from '@angular/common/http';\n" +
                    "import { Observable } from 'rxjs';\n\n" +
                    "// Setting withCredentials instructs the browser to send cookies\n" +
                    "// with every request - no Authorization header needed\n" +
                    "export const jwtInterceptor: HttpInterceptorFn = (req, next) => {\n" +
                    "\tconst authReq = req.clone({\n" +
                    "\t\twithCredentials: true\n" +
                    "\t});\n" +
                    "\treturn next(authReq);\n" +
                    "};"
            }
        },
        'Alert Data Service': {
            'Get Alerts': {
                "content": "// Service method that assembles every optional query parameter\n" +
                    "// into an HttpParams object for the /alerts endpoint\n" +
                    "getAlerts(params: {\n" +
                    "\tpage?: number,\n" +
                    "\tlimit?: number,\n" +
                    "\tsort?: string,\n" +
                    "\torder?: string,\n" +
                    "\tcategory?: string,\n" +
                    "\tsearch?: string,\n" +
                    "\tfrom?: Date,\n" +
                    "\tto?: Date\n" +
                    "} = {}) : Observable<any> {\n\n" +
                    "\tlet httpParams = new HttpParams();\n" +
                    "\tif (params.page) httpParams = httpParams.set('page', params.page);\n" +
                    "\tif (params.limit) httpParams = httpParams.set('limit', params.limit);\n" +
                    "\tif (params.sort) httpParams = httpParams.set('sort', params.sort);\n" +
                    "\tif (params.order) httpParams = httpParams.set('order', params.order);\n" +
                    "\tif (params.category) httpParams = httpParams.set('category', params.category);\n" +
                    "\tif (params.search) httpParams = httpParams.set('search', params.search);\n" +
                    "\tif (params.from) httpParams = httpParams.set('from', params.from.toISOString());\n" +
                    "\tif (params.to) httpParams = httpParams.set('to', params.to.toISOString());\n\n" +
                    "\treturn this.http.get(this.url, { params: httpParams });\n" +
                    "}"
            }
        },
        'Alert Listing Component': {
            'State': {
                "content": "export class AlertListing implements OnInit {\n" +
                    "\talerts: Alert[] = [];\n" +
                    "\ttotal = 0;\n" +
                    "\tpage = 1;\n" +
                    "\tlimit = 25;\n" +
                    "\tsort = 'reported';\n" +
                    "\torder = 'desc';\n" +
                    "\tcategory = '';\n" +
                    "\tsearch = '';\n" +
                    "\tfrom?: Date;\n" +
                    "\tto?: Date;\n" +
                    "\tdisplayedColumns = ['source', 'source_port', 'destination',\n" +
                    "\t\t\t\t\t\t'destination_port', 'category', 'reported'];"
            },
            'Load Alerts': {
                "content": "loadAlerts(): void {\n" +
                    "\tthis.alertData.getAlerts({\n" +
                    "\t\tpage: this.page,\n" +
                    "\t\tlimit: this.limit,\n" +
                    "\t\tsort: this.sort,\n" +
                    "\t\torder: this.order,\n" +
                    "\t\tcategory: this.category || undefined,\n" +
                    "\t\tsearch: this.search || undefined,\n" +
                    "\t\tfrom: this.from || undefined,\n" +
                    "\t\tto: this.to || undefined\n" +
                    "\t}).subscribe({\n" +
                    "\t\tnext: (res) => {\n" +
                    "\t\t\tthis.alerts = res.alerts;\n" +
                    "\t\t\tthis.total = res.total;\n" +
                    "\t\t},\n" +
                    "\t\terror: (err) => console.log('Error: ' + err)\n" +
                    "\t});\n" +
                    "}"
            },
            'Handlers': {
                "content": "onPageChange(event: PageEvent): void {\n" +
                    "\tthis.page = event.pageIndex + 1;\n" +
                    "\tthis.limit = event.pageSize;\n" +
                    "\tthis.loadAlerts();\n" +
                    "}\n\n" +
                    "onSortChange(event: Sort): void {\n" +
                    "\tthis.sort = event.active;\n" +
                    "\tthis.order = event.direction || 'desc';\n" +
                    "\tthis.page = 1;\n" +
                    "\tthis.loadAlerts();\n" +
                    "}"
            }
        },
        'Alert Listing Template': {
            'Mat Table': {
                "content": "<table mat-table [dataSource]=\"alerts\" matSort (matSortChange)=\"onSortChange($event)\">\n" +
                    "\t<ng-container matColumnDef=\"source\">\n" +
                    "\t\t<th mat-header-cell *matHeaderCellDef mat-sort-header>Source</th>\n" +
                    "\t\t<td mat-cell *matCellDef=\"let alert\">{{ alert.source }}</td>\n" +
                    "\t</ng-container>\n\n" +
                    "\t<ng-container matColumnDef=\"category\">\n" +
                    "\t\t<th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>\n" +
                    "\t\t<td mat-cell *matCellDef=\"let alert\">{{ alert.category }}</td>\n" +
                    "\t</ng-container>\n\n" +
                    "\t<ng-container matColumnDef=\"reported\">\n" +
                    "\t\t<th mat-header-cell *matHeaderCellDef mat-sort-header>Reported</th>\n" +
                    "\t\t<td mat-cell *matCellDef=\"let alert\">{{ alert.reported | date:'short' }}</td>\n" +
                    "\t</ng-container>\n\n" +
                    "\t<tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\n" +
                    "\t<tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n" +
                    "</table>"
            },
            'Mat Paginator': {
                "content": "<mat-paginator\n" +
                    "\t[length]=\"total\"\n" +
                    "\t[pageSize]=\"limit\"\n" +
                    "\t[pageSizeOptions]=\"[10, 25, 50, 100]\"\n" +
                    "\t(page)=\"onPageChange($event)\">\n" +
                    "</mat-paginator>"
            }
        }
    }

    for (const className in spaCode) {
        const lang = langMap[className] || 'javascript';
        for (const functionName in spaCode[className]) {
            for (const contentSection in spaCode[className][functionName]) {
                const code = spaCode[className][functionName][contentSection];
                spaCode[className][functionName][contentSection] = await highlight(code, lang);
            }
        }
    }

    return spaCode;
}
