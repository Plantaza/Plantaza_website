import {Inject, Injectable} from '@angular/core';
import {SHRAMBA_BRSKALNIKA} from "../classes/shramba";
import {RezultatAvtentikacije} from "../classes/rezultat-avtentikacije";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Uporabnik} from "../classes/uporabnik";

@Injectable({
  providedIn: 'root'
})
export class AvtentikacijaService {
  constructor(@Inject(SHRAMBA_BRSKALNIKA) private shramba: Storage, private http: HttpClient) { }
  private apiUrl = environment.apiUrl;

  private b64Utf8(niz: string): string {
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(niz),
          (znak: string) => {
            return '%' + ('00' + znak.charCodeAt(0).toString(16)).slice(-2);
          }
        )
        .join('')
    );
  };

  public jePrijavljen(): boolean {
    const zeton: string = this.vrniZeton();
    if (zeton) {
      const koristnaVsebina = JSON.parse(this.b64Utf8(zeton.split('.')[1]));
      return koristnaVsebina.exp > (Date.now() / 1000);
    } else {
      return false;
    }
  }

  public vrniTrenutnegaUporabnikaId(): any {
    if (this.jePrijavljen()) {
      const zeton: string = this.vrniZeton();
      const {_id} = JSON.parse(this.b64Utf8(zeton.split('.')[1]));
      console.log("ID: ",_id);
      return _id
    }
    else return ""
  }

  public vrniTrenutnegaUporabnika(): Uporabnik {
    if (this.jePrijavljen()) {
      const token: string = this.vrniZeton();
      const {
        _id,
        ime,
        email
        } = JSON.parse(atob(token.split('.')[1]));
      return {
        _id,
        ime,
        email
      } as unknown as Uporabnik;
    }
    else{
      return null;
    }
  }

  public async prijava(data: any): Promise<any> {
    const url: string = `${this.apiUrl}/prijava`;
    console.log(data)
    return this.http
      .post<any>(url,data)
      .toPromise()
      .then((rezultatAvtentikacije: RezultatAvtentikacije) => {
        this.shraniZeton(rezultatAvtentikacije["zeton"])
      });
  }

  public async registracijaUser(data: Uporabnik): Promise<any> {
    const url: string = `${this.apiUrl}/registracija`;
    // console.log(url);
    return this.http
      .post<any>(url, data)
      .toPromise()
      .then((rezultatAvtentikacije: RezultatAvtentikacije) => {
        this.shraniZeton(rezultatAvtentikacije["zeton"]);
      });
  }


  public odjava(): void {
    this.shramba.removeItem('prijavni-zeton');
  }

  public vrniZeton(): string {
    return <string>this.shramba.getItem('prijavni-zeton');
  }

  public shraniZeton(zeton: string): void {
    this.shramba.setItem('prijavni-zeton', zeton);

  }
}
